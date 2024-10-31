import { useSelector } from 'react-redux';

function AcronymTable() {
    const terms = useSelector((state) => state.terms);

    // Get all terms that have an acronym
    const getAcronyms = (termsObj) => {
        let allTerms = [];

        Object.values(termsObj).forEach(item => {
            Object.values(item).forEach(term => {
                if (term.title && term.title.includes('(') && term.title.includes(')')) {
                    const abbr = term.title.match(/(.*)\s\((.*)\)/);

                    if (abbr && abbr.length >= 3) {
                        const fullName = abbr[1].trim();
                        const abbreviation = abbr[2].trim();

                        // Check if the abbreviation already exists - template xml has been seen to contain duplicates
                        if (!allTerms.some(term => term.abbreviation === abbreviation)) {
                            allTerms.push({ fullName, abbreviation });
                        }
                    }
                }
            });
        });

        // Sort terms by abbreviation
        allTerms.sort((a, b) => a.abbreviation.localeCompare(b.abbreviation));
        return allTerms;
    };

    const filteredTerms = getAcronyms(terms);

    return (
        <table className="min-w-full divide-y divide-gray-200 mb-3">
            <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wider">
                        Acronym
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase tracking-wider">
                        Meaning
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {filteredTerms.map((term, index) => (
                    <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-[12px] text-gray-500">{term.abbreviation}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-[12px] text-gray-500">{term.fullName}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default AcronymTable;
