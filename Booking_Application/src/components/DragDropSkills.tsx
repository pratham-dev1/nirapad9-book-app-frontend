//@ts-nocheck
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// Function to move item between lists
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);
  destClone.splice(droppableDestination.index, 0, removed);
  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;
  return result;
};

const DragDropSkills = () => {
  const [items, setItems] = useState([
    {
      id: "p-skill",
      data: [
        { id: "1", title: "Item 1" },
        { id: "2", title: "Item 2" },
        { id: "3", title: "Item 3" },
      ],
    },
    {
      id: "s-skill",
      data: [
        { id: "4", title: "Item 4" },
        { id: "5", title: "Item 5" },
      ],
    },
  ]);
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const sourceId = result.source.droppableId;
    const destinationId = result.destination.droppableId;
    if (sourceId === destinationId) return;
    // if (sourceId === "p-skill" && items[0].data.length === 1) return;
    const source = items.find((item) => item.id === sourceId).data;
    const destination = items.find((item) => item.id === destinationId).data;
    const movedItems = move(
      source,
      destination,
      result.source,
      result.destination
    );
    const updatedItems = items.map((item) => {
      if (item.id === sourceId) {
        return { ...item, data: movedItems[sourceId] };
      } else if (item.id === destinationId) {
        return { ...item, data: movedItems[destinationId] };
      }
      return item;
    });
    setItems(updatedItems);
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {items.map((item, index) => (
        <Droppable droppableId={item.id} type="group" key={item.id}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{
                padding: "10px",
                background: "lightgrey",
                width: "140px",
                height: "auto",
                margin: 40,
              }}
            >
              {item.data.map((i, index) => {
                return (
                  <Draggable key={i.id} draggableId={i.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          userSelect: "none",
                          padding: "16px",
                          margin: "0 0 8px 0",
                          backgroundColor: "white",
                          ...provided.draggableProps.style,
                        }}
                      >
                        {i.title}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </DragDropContext>
  );
};
export default DragDropSkills;
