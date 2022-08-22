class ListModel<Model> extends Array {
  private list: Model[];

  map(func: Function): this {
    this.list = this.list.map((e, i, a) => func(e, i, a))
    return this
  }

  forEach(func: Function): void {
    this.list.forEach((e, i, a) => func(e, i, a))
  }

  filter(func: Function): ListModel<Model> {
    const list = this.list.filter((e, i, a) => func(e, i, a))
    const tm = new ListModel<Model>()
    tm.addAll(list)
    return tm
  }

  addAll(list: Model[]): void {
    this.list = list;
  }
  add(model: Model): void {
    this.list.push(model);
  }
  remove(index: number) {
    if (this.list.length < index + 1 || index < 0) {
      throw new Error(`index '${index}' doesnot exist`);
    }
    this.list.splice(index, 1);
  }
  clear(): void {
    this.list = [];
  }
  async toJson(): Promise<Array<object>> {
    return Promise.all(this.list.map(async (model: any) => {
      return model.toJson()
    }))
  }
  size(): number {
    return this.list.length;
  }

  // async toJson() {
  //     const e = await Promise.all(this.list);
  //     return e.map((model: any) => {
  //         return model.toJson();
  //     });
  // }
}

export default ListModel;
