class InjuryModel {
    // Fetch all injuries from the database
    static getAll(db) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM injuries', (error, results) => {
                if (error) {
                    console.error('Error fetching injuries:', error);
                    return reject(error);
                }
                // Log the result to see what you're getting
                console.log('Query results:', results);

                // Resolve the promise with the results (rows)
                resolve(results);
            });
        });
    }

    // Register a new injury in the database
    static async register(injuryData, db) {
        const { 
            rescuer_id,
            rescuer_name, 
            ski_run, 
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
            (rescuer_id, rescuer_name, ski_run, injury_points, medical_comment, rescuer_signature, name, birth_date, ski_card_photo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                rescuer_id,
                rescuer_name, 
                ski_run, 
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
