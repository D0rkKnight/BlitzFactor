import * as vscode from 'vscode';
import Token from './token';

export default interface CodeActionDescription {
    title: string;
    variables: string[] | undefined;
    token: Token
};