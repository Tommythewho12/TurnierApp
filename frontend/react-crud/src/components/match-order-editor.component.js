import React, {useState} from 'react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

export default function MatchOrderEditor(props) {
  console.log("props", props);
  const [items, setItems] = useState(props.data);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <>
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={items}
        strategy={verticalListSortingStrategy}
      >
        {
          items.map(item => <SortableItem key={item.id} id={item.id} data={{...item}} />)
        }
      </SortableContext>
    </DndContext>
    </>
  );
  
  function handleDragEnd(event) {
    const {active, over} = event;
    
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(({id}) => id === active.id);
        const newIndex = items.findIndex(({id}) => id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
}

function SortableItem(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: props.id});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <div className="row">
            <div className="col-1">
                {props.data.order}
            </div>
            <div className="col-1">
                {props.data.phase}
            </div>
            <div className="col-1">
                {props.data.group}
            </div>
            <div className="col-3">
                {props.data.home}
            </div>
            <div className="col-3">
                {props.data.guest}
            </div>
        </div>
    </div>
  );
}