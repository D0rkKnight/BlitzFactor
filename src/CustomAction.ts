import Token from './token';
import * as vscode from 'vscode';

export default class CustomAction {

    public title: string;
    public variables: string[] | undefined;
    public executeCB: (doc: vscode.TextDocument, token: Token, {}) => Promise<vscode.WorkspaceEdit | undefined>;

    constructor(title: string, variables: string[] | undefined, executeCB: (doc: vscode.TextDocument, token: Token, {}) => Promise<vscode.WorkspaceEdit | undefined>) {
        this.title = title;
        this.variables = variables;
        this.executeCB = executeCB;
    }

    public getDescription(): CustomActionDescription {
        return {
            title: this.title,
            variables: this.variables
        };
    }

    public async execute(doc: vscode.TextDocument, token: Token, variables: {}): Promise<vscode.WorkspaceEdit | undefined> {
        return await this.executeCB(doc, token, variables);
    }

}

export interface CustomActionDescription {

    title: string;
    variables: string[] | undefined;

}