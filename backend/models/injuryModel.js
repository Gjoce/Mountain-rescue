class InjuryModel {
    // Fetch all injuries from the database
    static async getAll(db) {
        const [rows] = await db.query('SELECT * FROM injuries');
        return rows;
    }

    // Register a new injury in the database
    static async register(injuryData, db) {
        const { 
            rescuer_id, 
            ski_run_id, 
            injury_points, 
            medical_comment, 
            rescuer_signature, 
            name,  
            birth_date, 
            ski_card_photo 
        } = injuryData;

        // Use a prepared statement to insert the injury record
        await db.query(
            `INSERT INTO injuries 
            (rescuer_id, ski_run_id, injury_points, medical_comment, rescuer_signature, name, birth_date, ski_card_photo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                rescuer_id, 
                ski_run_id, 
                JSON.stringify(injury_points), // Ensure injury_points is properly formatted
                medical_comment, 
                rescuer_signature, 
                name, 
                birth_date, 
                ski_card_photo
            ]
        );
    }
}

module.exports = InjuryModel;
