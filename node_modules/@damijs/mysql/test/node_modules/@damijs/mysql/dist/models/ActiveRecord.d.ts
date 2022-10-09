import ActiveQuery from './ActiveQuery';
import { IAttList } from './IRules';
/**
 *
 *
 * @abstract
 * @class ActiveRecords
 * @extends {ActiveQuery}
 */
declare abstract class ActiveRecords extends ActiveQuery {
    _validate: IAttList;
    constructor(tableName: string);
    /**
     * check if the loaded data are valid
     * @returns : true on validate, false on error
     */
    validate(): Promise<boolean>;
    /**
     * filter the loaded value againse model attribute,
     * remove all data that does not exist in model attribute
     * @param value : object to be filter
     * @returns : valid attributes
     */
    filterAttribute(value: object): {};
    attributeType(): {};
    /**
     * return all visiable fields on current scenario
     * @param value : field to be filter
     * @returns : visiable fields
     */
    getVisibleFields(value: object): {};
    /**
     * get all attributes of current model
     * @param all : on true, includes custom attributes
     * @returns : attributed of current model
     */
    getAttributes(all?: boolean): object;
    /**
     * load all value to respective attribute
     * @param attributes : attributes to be loaded
     * @returns : true on load, false if supplied attribute does not contains any attribute of model
     */
    load(attributes: object): boolean;
    /**
     * converts the model attribute value to json
     * @returns : json with model attribute values
     */
    toJson(): Promise<{}>;
}
export default ActiveRecords;
