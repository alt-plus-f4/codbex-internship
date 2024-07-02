import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface VacationsEntity {
    readonly Id: number;
    DateStart?: Date;
    DateEnd?: Date;
    Person?: number;
    Name?: string;
}

export interface VacationsCreateEntity {
    readonly DateStart?: Date;
    readonly DateEnd?: Date;
    readonly Person?: number;
    readonly Name?: string;
}

export interface VacationsUpdateEntity extends VacationsCreateEntity {
    readonly Id: number;
}

export interface VacationsEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            DateStart?: Date | Date[];
            DateEnd?: Date | Date[];
            Person?: number | number[];
            Name?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            DateStart?: Date | Date[];
            DateEnd?: Date | Date[];
            Person?: number | number[];
            Name?: string | string[];
        };
        contains?: {
            Id?: number;
            DateStart?: Date;
            DateEnd?: Date;
            Person?: number;
            Name?: string;
        };
        greaterThan?: {
            Id?: number;
            DateStart?: Date;
            DateEnd?: Date;
            Person?: number;
            Name?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            DateStart?: Date;
            DateEnd?: Date;
            Person?: number;
            Name?: string;
        };
        lessThan?: {
            Id?: number;
            DateStart?: Date;
            DateEnd?: Date;
            Person?: number;
            Name?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            DateStart?: Date;
            DateEnd?: Date;
            Person?: number;
            Name?: string;
        };
    },
    $select?: (keyof VacationsEntity)[],
    $sort?: string | (keyof VacationsEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface VacationsEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<VacationsEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface VacationsUpdateEntityEvent extends VacationsEntityEvent {
    readonly previousEntity: VacationsEntity;
}

export class VacationsRepository {

    private static readonly DEFINITION = {
        table: "VACATIONS",
        properties: [
            {
                name: "Id",
                column: "VACATIONS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
                required: true
            },
            {
                name: "DateStart",
                column: "VACATIONS_DATESTART",
                type: "DATE",
            },
            {
                name: "DateEnd",
                column: "VACATIONS_DATEEND",
                type: "DATE",
            },
            {
                name: "Person",
                column: "VACATIONS_PERSON",
                type: "INTEGER",
            },
            {
                name: "Name",
                column: "VACATIONS_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(VacationsRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: VacationsEntityOptions): VacationsEntity[] {
        return this.dao.list(options).map((e: VacationsEntity) => {
            EntityUtils.setDate(e, "DateStart");
            EntityUtils.setDate(e, "DateEnd");
            return e;
        });
    }

    public findById(id: number): VacationsEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "DateStart");
        EntityUtils.setDate(entity, "DateEnd");
        return entity ?? undefined;
    }

    public create(entity: VacationsCreateEntity): number {
        EntityUtils.setLocalDate(entity, "DateStart");
        EntityUtils.setLocalDate(entity, "DateEnd");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "VACATIONS",
            entity: entity,
            key: {
                name: "Id",
                column: "VACATIONS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: VacationsUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "DateStart");
        // EntityUtils.setLocalDate(entity, "DateEnd");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "VACATIONS",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "VACATIONS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: VacationsCreateEntity | VacationsUpdateEntity): number {
        const id = (entity as VacationsUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as VacationsUpdateEntity);
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
            table: "VACATIONS",
            entity: entity,
            key: {
                name: "Id",
                column: "VACATIONS_ID",
                value: id
            }
        });
    }

    public count(options?: VacationsEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "VACATIONS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: VacationsEntityEvent | VacationsUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("vacation-tool-Vacations-Vacations", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("vacation-tool-Vacations-Vacations").send(JSON.stringify(data));
    }
}
