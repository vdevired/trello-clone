import  { authAxios } from './util'
import  { backendUrl } from './const'

// All board state manipulating functions in this file
// So other files don't get bloated
export const onDragEnd = (board, setBoard) => (result) => {
    // Must update state synchromously so hit endpoint after setState
    // A bit optimistic but a must
    if (result.type === "list") {
        onDragEndList(board, setBoard, result);
        onDragEndListBackend(board,setBoard,result);
    }
    else if (result.type === "item") {
        onDragEndItem(board, setBoard, result);
        onDragEndItemBackend(board,setBoard,result);
    }
};


const getNewOrder = (sourceIndex, destinationIndex, arr) => {
    let newOrder;
    if (destinationIndex === 0) {
        if (arr.length) newOrder = arr[0].order / 2; 
        else newOrder = 65535;
    }
    else if (destinationIndex < (arr.length - 1)) {
        const isAdjacent = Math.abs(sourceIndex - destinationIndex) == 1;
        const neighbourOneOrder = parseFloat(isAdjacent ? arr[destinationIndex-1].order : arr[destinationIndex+1].order)
        const neighbourTwoOrder = parseFloat(arr[destinationIndex].order)
        newOrder = (neighbourOneOrder + neighbourTwoOrder) / 2;
    }
    else if (destinationIndex >= (arr.length - 1)) newOrder = parseFloat(arr[arr.length- 1].order) + 65535; 
    return newOrder.toFixed(15);
}

const onDragEndItem = (board, setBoard, result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return; // Dropped outside of list
    if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
    )
        return; // Position didn't change

    const sourceList = board.lists.find(
        (list) => list.id.toString() === source.droppableId
    );
    const item = sourceList.items.find(
        (item) => item.id.toString() === draggableId
    );
    const destinationList = board.lists.find(
        (list) => list.id.toString() === destination.droppableId
    );

    const newItems = [...sourceList.items];
    let newItems2;
    if (source.droppableId === destination.droppableId) {
        newItems2 = newItems;
    } else {
        newItems2 = [...destinationList.items];
    }
    newItems.splice(source.index, 1);
    newItems2.splice(destination.index, 0, item);

    const newList = {
        ...sourceList,
        items: newItems,
    };

    const newList2 = {
        ...destinationList,
        items: newItems2,
    };

    const newLists = board.lists.map((list) => {
        if (list.id === newList.id) return newList;
        else if (list.id === newList2.id) return newList2;
        return list;
    });

    const newBoard = {
        ...board,
        lists: newLists,
    };

    setBoard(newBoard);
};


const onDragEndItemBackend = async (board, setBoard, result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return; // Dropped outside of list
    if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
    )
        return; // Position didn't change
    
        
    const sourceList = board.lists.find(
        (list) => list.id.toString() === source.droppableId
    );
    const item = sourceList.items.find(
        (item) => item.id.toString() === draggableId
    );
    const destinationList = board.lists.find(
        (list) => list.id.toString() === destination.droppableId
    );

    const newOrder = getNewOrder(source.index,destination.index, destinationList.items);
    const {data} = await authAxios.put(`${backendUrl}/boards/items/${item.id}/`, {
       'title' : item.title,
       'order' : newOrder,
       'list' : destinationList.id,

    })

    updateCard(board, setBoard)(destinationList.id, data);
}

const onDragEndList = (board, setBoard, result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return; // Dropped outside of board
    if (source.index === destination.index) return; // Position didn't change, no need to compare droppableIds as only one droppable

    const list = board.lists.find(
        (list) => "list" + list.id.toString() === draggableId
    );

    const newLists = [...board.lists];
    newLists.splice(source.index, 1);
    newLists.splice(destination.index, 0, list);

    const newBoard = {
        ...board,
        lists: newLists,
    };

    setBoard(newBoard);
};

const onDragEndListBackend = async (board,setBoard,result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return; // Dropped outside of board
    if (source.index === destination.index) return; // Position didn't change, no need to compare droppableIds as only one droppable
    const list = board.lists.find(
        (list) => "list" + list.id.toString() === draggableId
    );
    
    const newOrder = getNewOrder(source.index,destination.index, board.lists);
    
    const {data} = await authAxios.put(`${backendUrl}/boards/lists/${list.id}/`, {
       'title' : list.title,
       'order' : newOrder
    })
    updateList(board, setBoard)(data);
};

export const addList = (board, setBoard) => (list) => {
    const newLists = [...board.lists, list];
    const newBoard = {
        ...board,
        lists: newLists,
    };

    setBoard(newBoard);
};

export const updateList = (_ , setBoard) => (updatedList) => {
    setBoard(
        board => {
            const newLists = board.lists.map((list) =>
                list.id === updatedList.id ? updatedList : list
            );
            const newBoard = {
                ...board,
                lists: newLists,
            };
            return newBoard;
        }
    )
};

export const addCard = (board, setBoard) => (listId, newCard) => {
    const newLists = board.lists.map((list) =>
        list.id === listId ? { ...list, items: [...list.items, newCard] } : list
    );

    const newBoard = {
        ...board,
        lists: newLists,
    };

    setBoard(newBoard);
};

export const updateCard = (_, setBoard) => (listId, updatedCard) => {
    setBoard(board => {
        const targetList = board.lists.find((list) => list.id === listId);
        const newItems = targetList.items.map((item) =>
            item.id === updatedCard.id ? updatedCard : item
        );
        const newList = {
            ...targetList,
            items: newItems,
        };
        const newLists = board.lists.map((list) =>
            list.id === newList.id ? newList: list
        );
        const newBoard = {
            ...board,
            lists: newLists,
        };
        return newBoard;
    }); 
};

// Filter boards into user boards and project boards
export const filterBoards = (boards) => {
    const starredBoards = [];
    const userBoards = []; // Array of board objects
    const projectBoards = []; // Array of project objects with boards key as we need titles
    if (!boards) return [userBoards, projectBoards, starredBoards];

    for (let i = 0; i < boards.length; i++) {
        let board = boards[i];
        if ("title" in board.owner) {
            let project = projectBoards.find(
                (project) => project.title === board.owner.title
            );
            if (!project) {
                projectBoards.push({
                    title: board.owner.title,
                    id: board.owner.id,
                    boards: [board],
                });
            } else {
                project.boards.push(board);
            }
        } else {
            userBoards.push(board);
        }
        if (board.is_starred) starredBoards.push(board);
    }

    return [userBoards, projectBoards, starredBoards];
};
