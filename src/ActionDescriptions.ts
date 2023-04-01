import * as vscode from 'vscode';
import Token from './token';

export interface CodeActionDescription {
    title: string;
    variables: string[] | undefined;
    token: Token
};

export interface SnippetDescription {
    name: string;
    snippet: string;
    vars: string[];
  }