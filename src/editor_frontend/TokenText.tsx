import React from "react";
import Token from "../token";
import { TokenType } from "../tokenTypes";
// import "./textColors.css";

/**
 *
 * @param param0 leaf token
 */
export default function TokenText({ tok }) {
  // Get the text
  const text = tok.text;

  // Get the color
  const colMap = {
    [TokenType.identifier]: "text-color--identifier",
    [TokenType.keyword]: "text-color--keyword",
    [TokenType.number]: "text-color--number",
    [TokenType.operator]: "text-color--operator",
    [TokenType.string]: "text-color--string",
    [TokenType.comment]: "text-color--comment",
    [TokenType.other]: "text-color--other",
  };

  const colorClass = colMap[tok.type];

  return <div className={"flow-line__text " + colorClass}>{text}</div>;
}
