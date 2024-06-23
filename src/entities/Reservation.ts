import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Repository } from 'typeorm';
import { Table } from './Table';

@Entity()
export class Reservation {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    dinerName!: string;

    @Column()
    reservationTime!: Date;

    @ManyToOne(() => Table, table => table.reservations)
    table!: Table;

    @Column({ nullable: true })
    groupId?: string;

    static async checkExistingReservation(tableId: number, reservationTime: Date, reservationRepository: Repository<Reservation>): Promise<boolean> {
        const reservationTimeEnd = new Date(reservationTime.getTime() + 2 * 60 * 60 * 1000);
        const existingReservation = await reservationRepository.createQueryBuilder('reservation')
            .where('reservation.table.id = :tableId', { tableId })
            .andWhere('reservation.reservationTime < :end', { end: reservationTimeEnd })
            .andWhere('reservation.reservationTime + interval \'2 hours\' > :start', { start: reservationTime })
            .getOne();
        return !!existingReservation;
    }

    static async checkOverlappingReservation(dinerName: string, reservationTime: Date, reservationRepository: Repository<Reservation>): Promise<boolean> {
        const reservationTimeEnd = new Date(reservationTime.getTime() + 2 * 60 * 60 * 1000);
        const overlappingReservation = await reservationRepository.createQueryBuilder('reservation')
            .where('reservation.dinerName = :dinerName', { dinerName })
            .andWhere('reservation.reservationTime < :end', { end: reservationTimeEnd })
            .andWhere('reservation.reservationTime + interval \'2 hours\' > :start', { start: reservationTime })
            .getOne();
        return !!overlappingReservation;
    }

    static async createNewReservation(dinerName: string, reservationTime: Date, table: Table, reservationRepository: Repository<Reservation>, groupId?: string): Promise<Reservation> {
        const reservation = new Reservation();
        reservation.dinerName = dinerName;
        reservation.reservationTime = reservationTime;
        reservation.table = table;
        reservation.groupId = groupId;

        await reservationRepository.save(reservation);
        return reservation;
    }
}
