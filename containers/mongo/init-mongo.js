db.createUser(
    {
        user:"admin",
        pd:"BM2022",
        roles: [
            {
                role: "readWrite",
                db: "BookMaster"
            }
        ]
    }
)