// All board state manipulating functions in this file
// So other files don't get bloated
export const onDragEnd = (board, setBoard) => (result) => {
    // Must update state synchromously so hit endpoint after setState
    // A bit optimistic but a must
    if (result.type === "list") onDragEndList(board, setBoard, result);
    else if (result.type === "item") onDragEndItem(board, setBoard, result);
};

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

export const addList = (board, setBoard) => (list) => {
    const newLists = [...board.lists, list];
    const newBoard = {
        ...board,
        lists: newLists,
    };

    setBoard(newBoard);
};

export const updateList = (board, setBoard) => (updatedList) => {
    const newLists = board.lists.map((list) =>
        list.id === updatedList.id ? updatedList : list
    );

    const newBoard = {
        ...board,
        lists: newLists,
    };

    setBoard(newBoard);
};

// Filter boards into user boards and project boards
export const filterBoards = (boards) => {
    const userBoards = []; // Array of board objects
    const projectBoards = []; // Array of project objects with boards key as we need titles
    if (!boards) return [userBoards, projectBoards];

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
    }

    return [userBoards, projectBoards];
};
