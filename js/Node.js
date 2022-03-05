export class Node {
    constructor(item_name) {
        this.item_name = item_name;
        this.parents = [];
        this.children = [];

        this.element = document.createElement("img");
        this.element.setAttribute("src", "./img/nodes/" + item_name + "_32x32.png");
    }

}