import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Table } from './Table';

@Entity()
export class Restaurant {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column("text", { array: true })
    endorsements!: string[];

    @OneToMany(() => Table, table => table.restaurant)
    tables!: Table[];
}
