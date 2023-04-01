// import React from "react";
// import PropTypes from "prop-types";
// import { CSSProperties } from "react";
// import { Menu, MenuItem } from "@mui/material";
// import Editor from "../editor";

// export default function ListMenu({ open, title, setCurrentMenu, menuPos }) {
//   return (
//     <Menu
//       open={open}
//       onClose={setCurrentMenu}
//       anchorReference="anchorPosition"
//       anchorPosition={anchorPosFromTL(menuPos)}
//     >
//       <MenuItem>{title}</MenuItem>
//       {Editor.codeActionDescriptions.map((desc) => {
//         return (
//           <MenuItem
//             onClick={() => {
//               // Editor.performAction(desc.title);
//               setSelectedActionTitle(desc.title);
//               setCurrentMenu(MenuType.CodeActionMapper);
//             }}
//           >
//             {desc.title}
//           </MenuItem>
//         );
//       })}
//     </Menu>
//   );
// }

// const anchorPosFromTL = (pos: { x: number; y: number }) => {
//   return { top: pos.y, left: pos.x };
// };
