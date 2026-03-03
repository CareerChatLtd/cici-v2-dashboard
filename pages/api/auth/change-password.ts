import {getSession, withApiAuthRequired} from "@auth0/nextjs-auth0";
import {AuthenticationClient} from "auth0"
import {NextApiRequest, NextApiResponse} from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    const {user} = await getSession(req, res);
    const {
        AUTH0_CONNECTION: connection,
        AUTH0_CLIENT_ID: clientId,
        AUTH0_DOMAIN: domain
    } = process.env
    const auth = new AuthenticationClient({domain, clientId})

    try {
        await auth.database.changePassword({
            connection,
            email: user.email,
            client_id: clientId,
        })
        return res.status(200).json({
            message: 'OK',
            error: null
        })
    } catch (error) {
        console.error({error});
        return res.status(500).json({
            message: `An error occurred resetting your password`,
            error: error.name
        })
    }
}

export default withApiAuthRequired(handler)
