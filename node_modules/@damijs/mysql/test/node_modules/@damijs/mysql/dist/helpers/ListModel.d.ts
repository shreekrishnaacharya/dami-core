declare class ListModel<Model> extends Array<Model> {
    addAll(list: Model[]): void;
    add(model: Model): void;
    remove(index: number): void;
    clear(): void;
    toJson(): Promise<Array<object>>;
    size(): number;
}
export default ListModel;
