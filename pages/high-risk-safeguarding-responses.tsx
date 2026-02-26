import Head from "next/head";
import {useEffect, useState} from 'react';
import MarkdownIt from 'markdown-it';
import Header from "@/components/Header";
import {withTenant} from "@/lib/auth";
import {Tenant} from "@/lib/types";

interface FrontMatter {
    nation: string;
    age: string;
}

interface Document {
    frontMatter: FrontMatter;
    content: string;
    html: string;
}


const md = new MarkdownIt({
    html: true,
    linkify: true,
    breaks: true
});

function parseFrontMatter(text: string): { frontMatter: FrontMatter; content: string } {
    const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = text.match(frontMatterRegex);

    if (!match) {
        return { frontMatter: { nation: '', age: '' }, content: text };
    }

    const frontMatterText = match[1];
    const content = match[2];

    const frontMatter: Record<string, string> = {};
    frontMatterText.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
            frontMatter[key.trim()] = valueParts.join(':').trim();
        }
    });

    return {
        frontMatter: {
            nation: frontMatter.nation || '',
            age: frontMatter.age || ''
        },
        content
    };
}

function formatAge(age: string): string {
    if (age === 'under18') return 'Under 18';
    if (age === 'over18') return 'Over 18';
    return age;
}

async function fetchDocuments(): Promise<Document[]> {
    const url = 'https://bot.cicichat.co.uk/api/v1/bots/cici/media/high-risk-safeguarding-responses.md';

    const response = await fetch(url);
    const markdownContent = await response.text();

    // Split by === to get individual documents
    const rawDocuments = markdownContent.split(/\n===\n/).filter(doc => doc.trim());

    return rawDocuments.map(docText => {
        const {frontMatter, content} = parseFrontMatter(docText.trim());
        const html = md.render(content);

        return {
            frontMatter,
            content,
            html
        };
    });
}

interface Props {
    tenant: Tenant;
}

function HighRiskSafeguardingResponses({tenant}: Props) {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDocuments()
            .then(docs => setDocuments(docs))
            .catch(err => {
                console.error('Error fetching safeguarding responses:', err);
                setError('Failed to load safeguarding responses');
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen" style={{backgroundColor: '#E8E6E5'}}>
            <Head>
                <title>Safeguarding Responses - CiCi Dashboard</title>
            </Head>
            <Header tenant={tenant} />

            <div className="mx-auto max-w-4xl px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Safeguarding Responses</h1>
                <p className="text-gray-700 mb-6">Manage the messages CiCi shows to users when safeguarding concerns are triggered.</p>

                {/* Tenant Custom Overrides Section */}
                <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Your messages</h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Low risk
                            </h3>
                            {tenant.safeguardingMessageLow ? (
                                <div
                                    className="prose prose-lg max-w-none bg-gray-50 p-4 rounded border border-gray-200"
                                    dangerouslySetInnerHTML={{ __html: md.render(tenant.safeguardingMessageLow) }}
                                />
                            ) : (
                                <p className="text-sm text-gray-500 italic">Default behaviour - CiCi generates a message based on the conversation.</p>
                            )}
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                High risk
                            </h3>
                            {tenant.safeguardingMessageHigh ? (
                                <div
                                    className="prose prose-lg max-w-none bg-gray-50 p-4 rounded border border-gray-200"
                                    dangerouslySetInnerHTML={{ __html: md.render(tenant.safeguardingMessageHigh) }}
                                />
                            ) : (
                                <p className="text-sm text-gray-500 italic">Default behaviour - CiCi shows a pre-written message (see below).</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Default Responses Section */}
                <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Default high-risk messages</h2>
                <p className="text-gray-700 mb-6">These are the default pre-written messages that CiCi shows when a high-risk safeguarding concern is triggered (if no custom override is provided above).</p>

                {loading && (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-600">
                        Loading...
                    </div>
                )}

                {error && (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center text-red-600">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        {documents.map((doc, index) => (
                        <div key={index}>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                {doc.frontMatter.nation} - {formatAge(doc.frontMatter.age)}
                            </h3>

                            <div
                                className="prose prose-lg max-w-none mb-8"
                                dangerouslySetInnerHTML={{ __html: doc.html }}
                            />

                            {index < documents.length - 1 && (
                                <hr className="my-8 border-gray-300" />
                            )}
                        </div>
                    ))}
                    </div>
                )}
            </div>

            <style jsx global>{`
                .prose {
                    color: #1f2937;
                }
                .prose strong {
                    color: #111827;
                    font-weight: 700;
                }
                .prose a {
                    color: #2563eb;
                    text-decoration: underline;
                }
                .prose a:hover {
                    color: #1d4ed8;
                }
                .prose ul {
                    list-style-type: disc;
                    margin-left: 1.5rem;
                    margin-top: 0.5rem;
                    margin-bottom: 0.5rem;
                }
                .prose li {
                    margin-top: 0.25rem;
                    margin-bottom: 0.25rem;
                }
                .prose p {
                    margin-top: 0.75rem;
                    margin-bottom: 0.75rem;
                }
                .prose hr {
                    border-top: 1px solid #d1d5db;
                    margin-top: 1.5rem;
                    margin-bottom: 1.5rem;
                }
            `}</style>
        </div>
    );
}

export default withTenant(HighRiskSafeguardingResponses);
