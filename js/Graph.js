import {Node} from "./Node.js"

export class Graph {
    constructor(parent) {
        this.parent = parent;
        this.nodes = {};
        this.selection = new Set();
        this.sphereHeight = 36;
        this.timestamp = undefined;

        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.resizeCanvas();
        this.parent.appendChild(this.canvas);
        window.addEventListener("resize", (event) => { this.redraw(); });

        // Implement drag'n drop
        this.parent.addEventListener("dragover", (event) => {
            event.preventDefault();
        })

        this.parent.addEventListener("drop", (event) => {
            event.preventDefault();

            let type = event.dataTransfer.getData("type");
            if(!type)
                return

            if(event.target == this.parent || event.target == this.canvas) {
                let rect = event.target.getBoundingClientRect();
                let x = event.clientX - rect.x;
                let y = event.clientY - rect.y;
    
                if(type == "new") {
                    let name = event.dataTransfer.getData("name");
                    this.addNode(name, x, y);
                } else if(type == "move") {
                    let id = event.dataTransfer.getData("id");
                    let node = this.nodes[id];
                    node.setPosition(x, y)

                    let sphere = Math.floor(y / this.sphereHeight);
                    node.sphere = parseInt(sphere);
                }
            } else if(event.target.classList.contains("node")) {
                if(type == "move") {
                    let parentId = event.dataTransfer.getData("id");
                    let childId = parseInt(event.target.getAttribute("data-id"));
                    Node.toggleConnection(this.nodes[parentId], this.nodes[childId]);
                }
            }

            // Draw and animate
            this.redraw();
            window.requestAnimationFrame(this.update.bind(this));
        })

        this.parent.addEventListener("click", (event) => {
            this.clearSelection();
        })
    }

    clearSelection() {
        for(let nodeId of this.selection) {
            this.toggleSelection(nodeId);
        }
    }

    toggleSelection(nodeId) {
        if(this.selection.has(nodeId)) {
            this.selection.delete(nodeId);
            this.nodes[nodeId].element.classList.remove("selected");
        } else {
            this.selection.add(nodeId);
            this.nodes[nodeId].element.classList.add("selected");
        }
    }


    addNode(name, x, y) {
        let node = new Node(name);
        this.nodes[node.id] = node;

        let sphere = Math.floor(y / this.sphereHeight);
        node.sphere = parseInt(sphere);

        this.parent.appendChild(node.element);
        node.setPosition(x, y);
        node.setDraggable("move");


        // Toggle node(s) selection
        node.element.addEventListener("click", (event) => {
            this.toggleSelection(node.id);
            event.stopPropagation();
        })

        // Toggle connection with other nodes
        node.element.addEventListener("auxclick", (event) => {
            if(event.button == 1) {
                if(this.selection.has(node.id))
                    return;

                for(let parentId of this.selection) {
                    let parent = this.nodes[parentId]
                    Node.toggleConnection(parent, node);
                }

                this.redraw();
            }
        });

        // Delete node(s)
        node.element.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            if(this.selection.has(node.id)) {
                this.selection.forEach((nodeId) => {
                    this.deleteNode(nodeId);
                });
            } else {
                this.deleteNode(node.id);
            }
            this.redraw();
            return false;
        })
    }

    deleteNode(nodeId) {
        let node = this.nodes[nodeId];

        for(let childId of node.children) {
            this.nodes[childId].removeParent(node.id);
        }

        for(let parentId of node.parents) {
            this.nodes[parentId].removeChild(node.id);
        }

        node.element.parentElement.removeChild(node.element);
        this.selection.delete(node.id);
        delete this.nodes[node.id];
    }


    resizeCanvas() {
        this.canvas.setAttribute("width", 0);
        this.canvas.setAttribute("height", 0);
        this.canvas.setAttribute("width", this.parent.clientWidth - 2);
        this.canvas.setAttribute("height", this.parent.clientHeight - 2);
    }


    redraw() {
        this.resizeCanvas();
        const { width, height } = this.canvas.getBoundingClientRect();

        this.context.fillStyle = "#0f0f0f";
        let y = 0;
        while(y < height) {
            this.context.fillRect(0, y, width, this.sphereHeight);
            y += 2 * this.sphereHeight;
        }

        this.context.lineWidth = 2;
        this.context.strokeStyle = "white";
        this.context.beginPath();
        for(let id in this.nodes) {
            let parent = this.nodes[id];

            for(let childId of parent.children) {
                let child = this.nodes[childId];

                this.context.moveTo(parent.position.x, parent.position.y);
                this.context.lineTo(child.position.x, child.position.y);
            }
        }
        this.context.stroke();
    }

    update(timestamp) {
        let redraw = false;
        
        if(this.timestamp == undefined) {
            this.timestamp = timestamp;
            window.requestAnimationFrame(this.update.bind(this));
            return;
        }
        let ms = timestamp - this.timestamp;
        this.timestamp += ms;

        // Compute forces
        for(let id in this.nodes) {
            let node = this.nodes[id];
            let [x, y] = [node.position.x, node.position.y];

            // Attract to sphere
            if(node.sphere != undefined) {
                let sphereY = this.sphereHeight * (node.sphere + 0.5);
                let dy = sphereY - y;
                if(Math.abs(dy) > 1e-5) {
                    node.addForce(0, 5 * dy);
                    redraw = true;
                }
            }

            // Repulse
            for(let id2 in this.nodes) {
                let node2 = this.nodes[id2];
                if(id == id2 || Node.areConnected(node, node2))
                    continue;

                if(node.sphere != node2.sphere)
                    continue;

                let dx = node2.position.x - node.position.x;
                if(Math.abs(dx) < 1.33 * this.sphereHeight) {
                    let fx = 300 / dx;
                    node.addForce(-fx, 0);
                    node2.addForce(fx, 0);
                }
            }
        }

        // Apply forces
        let dt = ms / 1000;
        if(dt > 1) {dt = 1};
        
        let limits = {
            xmin: 14, xmax: this.canvas.clientWidth - 14
        }
        for(let id in this.nodes) {
            this.nodes[id].applyForces(dt, limits);
        }

        if(true) {
            this.redraw();
        }
        window.requestAnimationFrame(this.update.bind(this));
    }
}