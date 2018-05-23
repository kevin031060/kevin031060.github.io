
"use strict";

class Jump {
    constructor(text) {
        let obj = text ? JSON.parse(text) : {};
        this.id = obj.id || 0;
        this.date = obj.date;
        this.text = obj.text;
        this.completed = obj.completed;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class TaskContract {
    constructor() {
        LocalContractStorage.defineProperty(this, "count");
        LocalContractStorage.defineMapProperty(this, "userTasks");
        LocalContractStorage.defineMapProperty(this, "tasks", {
            parse: function (text) {
                return new Task(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
    }

    init() {
        this.count = new BigNumber(1);
    }

    total() {
        return new BigNumber(this.count).minus(1).toNumber();
    }

    add(date, text, completed) {
        let from = Blockchain.transaction.from;
        let index = this.count;

        let task = new Task();
        task.id = index;
        task.date = date;
        task.text = text;
        task.completed = completed;

        this.tasks.put(index, task);
        let userTasks = this.userTasks.get(from) || [];
        userTasks.push(index);
        this.userTasks.put(from, userTasks);
        this.count = new BigNumber(index).plus(1);
    }

    update(id, text, completed) {
        let task = this.tasks.get(id);
        if(!task) {
            throw new Error("task not found");
        }
        task.completed = completed;
        task.text = text;
        this.tasks.put(id, task);
    }

    delete(id) {
        let task = this.tasks.get(id);
        if(!task) {
            throw new Error("task not found");
        }
        this.tasks.del(id);
    }

    get(limit, offset, taskType = 'any') {
        let arr = [];
        offset = new BigNumber(offset);
        limit = new BigNumber(limit);

        for (let i = offset; i.lessThan(offset.plus(limit)); i = i.plus(1)) {
            let index = i.toNumber();
            let task = this.tasks.get(index);
            if (task) {
                console.warn('#1');
                if(taskType == 'active' && !task.completed) {
                    arr.push(task);
                    continue;
                }
                if(taskType == 'completed' && task.completed) {
                    arr.push(task);
                    continue;
                }
                if(taskType == 'any') {
                    arr.push(task);
                }
            }
        }

        return arr;
    }

    getByWallet(wallet) {
        wallet = wallet || Blockchain.transaction.from;
        let taskIds = this.userTasks.get(wallet);
        if (!taskIds) {
            throw new Error(`Wallet = ${wallet} does not have any tasks `);
        }

        let arr = [];
        for (const id of taskIds) {
            let task = this.tasks.get(id);
            if(task) {
                arr.push(task);
            }
        }
        return arr;
    }
}

module.exports = TaskContract;
