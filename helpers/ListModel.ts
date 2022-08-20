class ListModel {
  private list: any[];
  constructor(list = []) {
    this.list = list;
  }

  map(func: Function) {
    return this.list.map((e, i, a) => func(e, i, a))
  }

  forEach(func: Function) {
    return this.list.forEach((e, i, a) => func(e, i, a))
  }

  filter(func: Function) {
    const list = this.list.filter((e, i, a) => func(e, i, a))
    return new ListModel(list)
  }

  add(model: any) {
    this.list.push(model);
  }
  remove(index: number) {
    if (this.list.length < index + 1 || index < 0) {
      throw new Error(`index '${index}' doesnot exist`);
    }
    this.list.splice(index, 1);
  }
  clear() {
    this.list = [];
  }
  async toJson() {
    return new Promise((resolve) => {
      let arr = [];
      this.list.forEach(async (model: any) => {
        arr.push(await model.toJson())
      });
      resolve(arr)
    })
  }
  size() {
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
