import * as vscode from 'vscode';
import Token from './token';

/**
 * TODO: Standardize all these descriptions into one interface
 * These hold info for the frontend to display
 */
export interface CodeActionDescription {
    title: string;
    vars: string[] | undefined;
    token: Token
};

export interface SnippetDescription {
    name: string;
    snippet: string;
    vars: string[];
}