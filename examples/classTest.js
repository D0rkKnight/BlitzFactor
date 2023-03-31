export default class Test {

    Rename = 'field';
    get Rename() {
        return this.Rename;
    }
    set Rename(value) {
        this.Rename = value;
    }
    get field() {
        return this.Rename;
    }
    set field(value) {
        this.Rename = value;
    }

    constructor() {
        console.log('Test class');
    }

    foo() {
        console.log('foo');
    }
}
