export = algorithmia;
declare function algorithmia(key: any, address?: any): BasicOptions;

interface BasicOptions {
    algo(path: any): { pipe(content: any): Promise<any> };
    client(key: any, address: any): any;
    file(path: any): Promise<any>;
}
