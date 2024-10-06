class InjuryModel {
    // Fetch all injuries from the database
    static async getAll(db) {
        const [rows] = await db.query('SELECT * FROM injuries');
        return rows;
    }

    // Register a new injury in the database
    static async register(injuryData, db) {
        const { rescuerId, skiRunId, patientId, injuryPoints, medicalComment, rescuerSignature } = injuryData;

        await db.query(
            `INSERT INTO injuries (rescuer_id, ski_run_id, patient_id, injury_points, medical_comment, rescuer_signature)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [rescuerId, skiRunId, patientId, injuryPoints, medicalComment, rescuerSignature]
        );
    }
}

module.exports = InjuryModel;
