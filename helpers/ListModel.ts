class ListModel {
  private list: any[];
  constructor() {
    this.list = [];
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
  toJson() {
    return this.list.map((model: any) => {
      return model.toJson();
    });
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
