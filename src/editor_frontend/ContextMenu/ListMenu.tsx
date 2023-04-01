// import React from "react";
// import PropTypes from "prop-types";
// import { CSSProperties } from "react";
// import { Menu, MenuItem } from "@mui/material";
// import Editor from "../editor";

// export default function ListMenu({ open }) {
//   return (
//     <Menu
//       open={open}
//       onClose={() => setCurrentMenu(MenuType.None)}
//       anchorReference="anchorPosition"
//       anchorPosition={anchorPosFromTL(menuPos)}
//     >
//       <MenuItem>Code Actions</MenuItem>
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
