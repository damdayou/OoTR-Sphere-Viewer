import {Node} from "./Node.js"

export class Graph {
    constructor(parent) {
        this.parent = parent;
        this.nodes = {};
        this.selection = new Set();

        // Implement drag'n drop
        this.parent.addEventListener("dragover", (event) => {
            event.preventDefault();
        })

        this.parent.addEventListener("drop", (event) => {
            event.preventDefault();
            let type = event.dataTransfer.getData("type");
            if(type == "new") {
                let name = event.dataTransfer.getData("name");
                this.addNode(name, event.clientX, event.clientY);
            } else if(type == "move") {
                let id = event.dataTransfer.getData("id");
                let node = this.nodes[id];
                node.setPosition(event.clientX, event.clientY)
            }
        })
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


        // Listeners
        node.element.addEventListener("click", (event) => {
            console.log("Click on node #" + node.id);
            this.toggleSelection(node.id);
        })

        node.element.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            if(this.selection.has(node.id)) {
                this.selection.forEach((node2) => {
                    this.deleteNode(node2);
                });
            } else {
                this.deleteNode(node.id);
            }
            return false;
        })
    }

    deleteNode(nodeId) {
        let node = this.nodes[nodeId];

        for(let child of node.children) {
            child.removeParent(node.id);
        }

        for(let parent of node.parents) {
            parent.removeChild(node.id);
        }

        node.element.parentElement.removeChild(node.element);
        this.selection.delete(node.id);
        delete this.nodes[node.id];
    }
}