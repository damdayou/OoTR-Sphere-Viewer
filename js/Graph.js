import {Node} from "./Node.js"

export class Graph {
    constructor(parent) {
        this.parent = parent;
        this.nodes = {};

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

    addNode(name, x, y) {
        let node = new Node(name);
        this.nodes[node.id] = node;

        this.parent.appendChild(node.element);
        node.setPosition(x, y);
        node.setDraggable("move");

        node.element.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            this.deleteNode(node.id);
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
        delete this.nodes[node.id];
    }
}