class ListModel<Model> extends Array<Model> {
  addAll(list: Model[]): void {
    list.forEach(e => this.push(e))
  }
  add(model: Model): void {
    this.push(model);
  }
  remove(index: number) {
    if (this.length < index + 1 || index < 0) {
      throw new Error(`index '${index}' doesnot exist`);
    }
    this.splice(index, 1);
  }
  clear(): void {
    this.length = 0;
  }

  async toJson(): Promise<Array<object>> {
    return Promise.all(this.map(async (model: any) => {
      return model.toJson()
    }))
  }
  size(): number {
    return this.length;
  }

  // async toJson() {
  //     const e = await Promise.all(this.list);
  //     return e.map((model: any) => {
  //         return model.toJson();
  //     });
  // }
}

export default ListModel;
