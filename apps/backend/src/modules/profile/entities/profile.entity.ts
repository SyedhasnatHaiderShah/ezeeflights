import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";



@Entity("saved_travelers")
export class SavedTraveler {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "user_id", type: "varchar", length: 36 })
  userId: string;

  @Column({ name: "full_name", type: "varchar", length: 150 })
  fullName: string;

  @Column({ name: "passport_number", type: "varchar", length: 50 })
  passportNumber: string;

  @Column({ type: "date" })
  dob: string;

  @Column({ type: "varchar", length: 80 })
  nationality: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  gender: "MALE" | "FEMALE" | "OTHER" | "UNSPECIFIED" | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt: Date;
}


export type SavedTravelerEntity = SavedTraveler;
