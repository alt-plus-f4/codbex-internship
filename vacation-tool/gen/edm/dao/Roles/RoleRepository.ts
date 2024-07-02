import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface RoleEntity {
    readonly Id: number;
    Name?: string;
}

export interface RoleCreateEntity {
    readonly Name?: string;
}

export interface RoleUpdateEntity extends RoleCreateEntity {
    readonly Id: number;
}

export interface RoleEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
    },
    $select?: (keyof RoleEntity)[],
    $sort?: string | (keyof RoleEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface RoleEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<RoleEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface RoleUpdateEntityEvent extends RoleEntityEvent {
    readonly previousEntity: RoleEntity;
}

export class RoleRepository {

    private static readonly DEFINITION = {
        table: "ROLE",
        properties: [
            {
                name: "Id",
                column: "ROLE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "ROLE_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(RoleRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: RoleEntityOptions): RoleEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): RoleEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: RoleCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "ROLE",
            entity: entity,
            key: {
                name: "Id",
                column: "ROLE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: RoleUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "ROLE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "ROLE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: RoleCreateEntity | RoleUpdateEntity): number {
        const id = (entity as RoleUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as RoleUpdateEntity);
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
            table: "ROLE",
            entity: entity,
            key: {
                name: "Id",
                column: "ROLE_ID",
                value: id
            }
        });
    }

    public count(options?: RoleEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "ROLE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: RoleEntityEvent | RoleUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("vacation-tool-Roles-Role", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("vacation-tool-Roles-Role").send(JSON.stringify(data));
    }
}
