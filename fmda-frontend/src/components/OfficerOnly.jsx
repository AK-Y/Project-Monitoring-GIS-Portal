import { useSelector } from 'react-redux';

/**
 * A wrapper component that only renders its children if the current user has Officer-level (Add Data) privileges.
 * Officers include: ADMIN, JE, SDE, XEN, OFFICER.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to show to officers
 * @param {React.ReactNode} [props.fallback=null] - Optional content to show to non-officers
 */
const OfficerOnly = ({ children, fallback = null }) => {
    const { user } = useSelector((state) => state.auth);
    const officerRoles = ['ADMIN', 'JE', 'SDE', 'XEN', 'OFFICER'];

    if (user && officerRoles.includes(user.role)) {
        return children;
    }

    return fallback;
};

export default OfficerOnly;
