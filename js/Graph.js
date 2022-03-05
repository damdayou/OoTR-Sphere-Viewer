import {Node} from "./Node.js"

export class Graph {
    constructor(parent) {
        this.parent = parent;
        this.nodes = {};
        this.selection = new Set();

        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.resizeCanvas();
        this.parent.appendChild(this.canvas);
        window.addEventListener("resize", (event) => { this.resizeCanvas(); });

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
                }
            } else if(event.target.classList.contains("node")) {
                if(type == "move") {
                    let parentId = event.dataTransfer.getData("id");
                    let childId = parseInt(event.target.getAttribute("data-id"));
                    Node.toggleConnection(this.nodes[parentId], this.nodes[childId]);
                }
            }

            this.redraw();
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
        this.canvas.setAttribute("width", this.parent.clientWidth - 4);
        this.canvas.setAttribute("height", this.parent.clientHeight - 4);
    }


    redraw() {
        this.resizeCanvas();

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
}