import {Categories} from "./js/Categories.js"
import {Node} from "./js/Node.js"
import {Graph} from "./js/Graph.js"

let pool_area = document.querySelector("#node-pool");
let graph_area = document.querySelector("#graph-view");

let graph = new Graph(graph_area);

// Populate pool
let pool_nodes = [];
for(let [name, subcategory] of Object.entries(Categories)) {
    let div = document.createElement("div");
    div.classList.add("category");
    div.setAttribute("data-name", name);
    pool_area.appendChild(div);

    for(let [subname, items] of Object.entries(subcategory)) {
        let subdiv = document.createElement("div");
        subdiv.classList.add("subcategory");
        subdiv.setAttribute("data-name", subname);
        div.appendChild(subdiv);

        for(let item of items) {
            let node = new Node(item);
            subdiv.appendChild(node.element);
            pool_nodes.push(node);
            node.setDraggable("new");
        }
    }
}