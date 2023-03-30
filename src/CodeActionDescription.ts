import * as vscode from 'vscode';

export default interface CodeActionDescription {
    title: string;
    variables: string[] | undefined;
};