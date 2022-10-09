import { ActiveRecords } from "../dist";

class Note extends ActiveRecords {

    _uid: number = null
    rules = () => {
        return {
            id: ['number'],
            title: ['string', { max: 20 }],
            description: ['required', 'string', { max: 500 }],
            fk_user_id: ['required', 'number'],
            votes: ['number'],
            review: ['number'],
            supporters: ['number'],
            parent_id: ['number'],
            ptype: ['number'],
            create_at: ['string'],
            state: ['number'],
            status: ['number']
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
                const ids = model['voters'].map(e => e["fk_user_id"])
                const uv = new User();
                uv.setScenario("VOTERS")
                const res = await uv.find(q => {
                    return q.andWhere({ id: ids })
                }).all();
                return await res.toJson()
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
            pmeta: async (model) => {
                if (isEmpty(model['meta'])) {
                    return [];
                }
                return model['meta'];
            },
            meta: async (model: Post): Promise<ListModel<PostMeta>> => {
                const meta = new PostMeta()
                const mlist = await meta.find(query => {
                    return query.andWhere({ fk_post_id: model.id })
                }).all()
                return mlist
            },
            comments: async (model): Promise<ListModel<Post>> => {
                const post = new Post()
                post.setScenario("COMMENT");
                post.getFkUser().getFkVote(this._uid)
                const cmt = await post.find((query => {
                    return query.andWhere({ 'post.parent_id': model.id }).andWhere("post.id!=post.parent_id")
                })).all()
                return cmt
            },
            hasVote: async (model: Post): Promise<number> => {
                if ('fkVote' in model && !isEmpty(model['fkVote'])) {
                    return 1
                }
                return 0;
            },
            ptype: 'ptype',
            user_dp: (model): string => {
                if (isEmpty(model['fkUser'])) {
                    return null;
                }
                return Url.to('image', [model['fkUser']['img'], 'thumb'], true);
            },
            create_at: "create_at",
            createAt: (model): string => {
                const dt = new Date(model["create_at"])
                return dt.toLocaleString()
            },
            status: (model): string => {
                return Post.postStatus(model.status);
            },
            statusCode: 'status',

        };
    };

    static postStatus(code: number | string) {
        if (code == Post.eStatus.REVEIEW) {
            return "Review";
        } else if (code == Post.eStatus.VOTING) {
            return "Voting"
        } else if (code == Post.eStatus.ACCEPETD) {
            return "Accepted"
        } else if (code == Post.eStatus.REJECTED) {
            return "Rejected"
        }
    }

    getFkUser() {
        return this.hasOne(User, { id: "fk_user_id" }, "fkUser")
    }

    getMeta() {
        return this.hasMany(PostMeta, ["fk_post_id", "id"], "meta")
    }

    getComments() {
        return this.hasMany(Post, ["parent_id", "id"], "comments")
    }
    /** get voting data along with current module */
    getFkVote(userid: number) {
        this._uid = userid
        return this.hasOne(UserVotes, { fk_post_id: "id", "custom": [["AND", "=", "user_votes.fk_user_id", userid]] }, "fkVote")
    }

    getVoter() {
        return this.hasMany(UserVotes, ["fk_post_id", "id"], "voters")
    }

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
        if (this.ptype == Post.type.POST && type == Query.INSERT) {
            let query = `UPDATE post set parent_id=id WHERE parent_id=0 LIMIT 1`
            await this.getDb().execute(query);
        }
        return true;
    }

}