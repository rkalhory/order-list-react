function createTree(children,level) {
    let temp={
        title: children?.Title,
        value: children?.Id,
        disabled:level>=3,
        children:children?.Children?.map(c=>createTree(c,level+1))
    }
    return temp
}


function searchTree(tree, searchId){
    for (let i=0;i<tree.length;i++){
        if (tree[i].value === searchId) {
            return tree[i];
        }else if(tree[i]?.children?.length){
            const found = searchTree(tree[i]?.children, searchId);
            if (found) {
                return found;
            }
        }
    }
}

function createTreeOrder(children) {
    let temp={
        id: children?.Id,
        priority:children.Priority,
        title: children?.Title,
        expanded: true,
        children:children?.Children?.map(c=>createTreeOrder(c))
    }
    return temp
}


export { createTree,searchTree,createTreeOrder};