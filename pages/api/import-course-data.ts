import {insertCourses, insertProviders} from "@/lib/import";
import {withAdminCheck} from "@/lib/auth-server";

export default withAdminCheck(async (req, res) => {
    try {
        await insertProviders()
        await insertCourses()
        return res.status(200).json({message: 'Import complete'});
    } catch (error) {
        return res.status(500).json({error});
    }
})

