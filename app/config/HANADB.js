import hana from '@sap/hana-client';

function consultas(SqlQuery, callback) {
    console.log("Sentencia: " + SqlQuery)

    let conn = hana.createConnection();
    let conn_params = {
        serverNode: '192.168.0.154:30015',
        uid: 'SYSTEM',
        pwd: 'B1Admin$'
    };

    conn.connect(conn_params, (err) => {
        if (err) {
            callback(err)
        } else {
            conn.exec(SqlQuery, (err, result) => {
                if (err) {
                    callback(err)
                } else {
                    conn.disconnect();
                    callback(null, result);
                }
            })
        }
        return null
    });
}

export {consultas};


