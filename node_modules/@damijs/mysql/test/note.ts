import { ActiveRecords, QueryBuild } from "@damijs/mysql";
import { isEmpty } from "@damijs/hp";
import Rid from "@damijs/rid";

class Note extends ActiveRecords {

    rules = () => {
        return {
            id: ['number'],
            title: ['string', { max: 20 }],
            description: ['required', 'string', { max: 500 }],
            fk_user_id: ['required', 'number'],
            noteid: ['number'],
            type: ['number', { oneof: [1, 2, 3] }]
        };
    }

    visibility = () => {
        return {
            READ: [
                "fk_user_id", "votes"
            ],
            VIEW: [
                "_id", "post_id", "ptype"
            ],
        }
    }

    fields = () => {
        return {
            _id: "id",
            post_id: "post_id",
            parent_id: 'parent_id',
            userid: "fk_user_id",
            post_detail: "post_detail",
            review: "review",
            voters: async (model) => {
                if (isEmpty(model['voters'])) {
                    return [];
                }
            },
            votes: "votes",
            tot_votes: (model): number => {
                if ("countReport" in model && model["countReport"] != null) {
                    return model["countReport"]["tot_votes"]
                } else {
                    return 0
                }
            },
            supporters: 'supporters',
            tags: "tags",
            ptype: 'ptype',
            create_at: "create_at",
            createAt: (model): string => {
                const dt = new Date(model["create_at"])
                return dt.toLocaleString()
            },
            statusCode: 'status',

        };
    };

    // getFkUser() {
    //     return this.hasOne(User, { id: "fk_user_id" }, "fkUser")
    // }

    getCounter() {
        return this.glueQuery((result) => {
            const ids = result.map(e => e.id)
            const query = new QueryBuild();
            query.select([
                "user_votes.parent_id as " + this.getMyId(),
                "COUNT(id) as tot_votes",
            ]).from("user_votes")
                .andWhere({ parent_id: ids })
                .groupBy("user_votes.parent_id")
            return query;
        }, "countReport")
    }

    async beforeSave() {
        this.setValue('post_id', Rid({ len: 3, saperator: '2' }));
        return true
    }
    async afterDelete(flag: Boolean) {
        let query = `DELETE user_votes FROM user_votes LEFT JOIN post ON post.id=user_votes.fk_post_id WHERE post.id IS NULL`
        await this.getDb().execute(query);
        return flag;
    }

    async afterSave(type) {
        let query = `UPDATE post set parent_id=id WHERE parent_id=0 LIMIT 1`
        await this.getDb().execute(query);
        return true;
    }

}