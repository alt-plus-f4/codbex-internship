import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface PersonEntity {
    readonly Id: number;
    Name?: string;
    DaysLeft?: number;
    Role?: number;
}

export interface PersonCreateEntity {
    readonly Name?: string;
    readonly DaysLeft?: number;
    readonly Role?: number;
}

export interface PersonUpdateEntity extends PersonCreateEntity {
    readonly Id: number;
}

export interface PersonEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            DaysLeft?: number | number[];
            Role?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            DaysLeft?: number | number[];
            Role?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            DaysLeft?: number;
            Role?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            DaysLeft?: number;
            Role?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            DaysLeft?: number;
            Role?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            DaysLeft?: number;
            Role?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            DaysLeft?: number;
            Role?: number;
        };
    },
    $select?: (keyof PersonEntity)[],
    $sort?: string | (keyof PersonEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface PersonEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<PersonEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface PersonUpdateEntityEvent extends PersonEntityEvent {
    readonly previousEntity: PersonEntity;
}

export class PersonRepository {

    private static readonly DEFINITION = {
        table: "PERSON",
        properties: [
            {
                name: "Id",
                column: "PERSON_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
                required: true
            },
            {
                name: "Name",
                column: "PERSON_NAME",
                type: "VARCHAR",
            },
            {
                name: "DaysLeft",
                column: "PERSON_DAYSLEFT",
                type: "INTEGER",
            },
            {
                name: "Role",
                column: "PERSON_ROLE",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(PersonRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: PersonEntityOptions): PersonEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): PersonEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: PersonCreateEntity): number {
        if (entity.DaysLeft === undefined || entity.DaysLeft === null) {
            (entity as PersonEntity).DaysLeft = 25;
        }
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "PERSON",
            entity: entity,
            key: {
                name: "Id",
                column: "PERSON_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: PersonUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "PERSON",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PERSON_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: PersonCreateEntity | PersonUpdateEntity): number {
        const id = (entity as PersonUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as PersonUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "PERSON",
            entity: entity,
            key: {
                name: "Id",
                column: "PERSON_ID",
                value: id
            }
        });
    }

    public count(options?: PersonEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "PERSON"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: PersonEntityEvent | PersonUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("vacation-tool-People-Person", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("vacation-tool-People-Person").send(JSON.stringify(data));
    }
}
