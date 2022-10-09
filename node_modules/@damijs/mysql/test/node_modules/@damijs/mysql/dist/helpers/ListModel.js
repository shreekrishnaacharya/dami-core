var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class ListModel extends Array {
    addAll(list) {
        list.forEach(e => this.push(e));
    }
    add(model) {
        this.push(model);
    }
    remove(index) {
        if (this.length < index + 1 || index < 0) {
            throw new Error(`index '${index}' doesnot exist`);
        }
        this.splice(index, 1);
    }
    clear() {
        this.length = 0;
    }
    toJson() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all(this.map((model) => __awaiter(this, void 0, void 0, function* () {
                return model.toJson();
            })));
        });
    }
    size() {
        return this.length;
    }
}
export default ListModel;
