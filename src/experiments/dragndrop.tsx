// import * as React from "react";
// import { ConnectDragPreview, ConnectDragSource, useDrag, useDrop } from "react-dnd";
// import "./styles.css";

// const BLOCK_TYPES = ["Heading", "Paragraph", "Quote"];

// const Block = ({ blockType, index, moveBlock }) => {
//   const [{ isDragging }, dragRef] = useDrag({
//     item: { type: "block", index },
//     collect: (monitor) => ({
//       isDragging: monitor.isDragging()
//     })
//   }) as [{ isDragging: boolean }, () => void];

//   const [{ canDrop, isOver }, dropRef] = useDrop({
//     accept: "block",
//     hover(item, monitor) {
//       if (item.index !== index) {
//         moveBlock(item.index, index);
//         item.index = index;
//       }
//     },
//     collect: (monitor) => ({
//       canDrop: monitor.canDrop(),
//       isOver: monitor.isOver()
//     })
//   });

//   const opacity = isDragging ? 0.5 : 1;

//   return (
//     <div
//       className={`block ${blockType} ${canDrop && isOver ? "drop-target" : ""}`}
//       ref={(node) => dragRef(dropRef(node))}
//       style={{ opacity }}
//     >
//       {blockType} {index}
//     </div>
//   );
// };

// const BlockList = ({ blocks, moveBlock }) => {
//   return (
//     <div className="block-list">
//       {blocks.map((block, index) => (
//         <Block
//           key={index}
//           index={index}
//           blockType={block}
//           moveBlock={moveBlock}
//         />
//       ))}
//     </div>
//   );
// };

// export default function App() {
//   const [selectedBlockIndex, setSelectedBlockIndex] = React.useState(null);
//   const [blocks, setBlocks] = React.useState(BLOCK_TYPES);

//   const moveBlock = (dragIndex, hoverIndex) => {
//     const newBlocks = [...blocks];
//     newBlocks.splice(hoverIndex, 0, newBlocks.splice(dragIndex, 1)[0]);
//     setBlocks(newBlocks);
//   };

//   return (
//     <div className="App">
//       <h1>Drag and Drop Text Blocks</h1>
//       <BlockList blocks={blocks} moveBlock={moveBlock} />
//     </div>
//   );
// }
