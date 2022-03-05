let ID = 0;
function new_id() {
    ID += 1;
    return ID;
}

export class Node {
    constructor(item_name) {
        this.id = new_id();
        this.item_name = item_name;
        this.parents = new Set();
        this.children = new Set();
        this.position = {x: undefined, y: undefined};

        this.element = document.createElement("img");
        this.element.setAttribute("src", "./img/nodes/" + item_name + "_32x32.png");
        this.element.setAttribute("data-id", this.id);
        this.element.classList.add("node");
    }

    setPosition(x, y) {
        let w = this.element.clientWidth;
        let h = this.element.clientHeight;

        this.position.x = x;
        this.position.y = y;

        this.element.style.left = (x - 0.5 * w) + "px";
        this.element.style.top = (y - 0.5 * h) + "px";
    }

    removeParent(nodeId) {
        this.parents.delete(nodeId);
    }

    removeChild(nodeId) {
        this.children.delete(nodeId);
    }

    setDraggable(type) {
        this.element.setAttribute("draggable", "true");

        if(type == "new") {
            this.element.addEventListener("dragstart", event => {
                event.dataTransfer.setData("text/plain", "");
                event.dataTransfer.setData("type", "new");
                event.dataTransfer.setData("name", this.item_name);
            });
        } else if(type == "move") {
            this.element.addEventListener("dragstart", event => {
                event.dataTransfer.setData("text/plain", "");
                event.dataTransfer.setData("type", "move");
                event.dataTransfer.setData("id", this.id);
            });
        }
    }

}


Node.toggleConnection = function(parent, child) {
    if(parent.children.has(child.id) && child.parents.has(parent.id)) {
        parent.children.delete(child.id);
        child.parents.delete(parent.id);
        return false;
    }

    if(!parent.children.has(child.id) && !child.parents.has(parent.id)) {
        parent.children.add(child.id);
        child.parents.add(parent.id);
        return true;
    }

    console.log("Warning: asymetric connection detected between nodes #" + parent.id + " and #" + child.id);
}