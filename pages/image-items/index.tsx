import {useRouter} from 'next/router'
import {AnchorButton, Button, FocusStyleManager, InputGroup, Spinner} from '@blueprintjs/core'
import Header from "@/components/Header";
import {useEffect, useState} from "react";
import Head from "next/head";
import {debounce} from "@/lib/debounce";
import {ErrorBlock} from "@/lib/cms/error-block";
import ScreenHeader from "@/components/ScreenHeader";
import {withAdminUser} from "@/lib/auth";

FocusStyleManager.onlyShowFocusOnTabs();

const ListImageItems = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState([])
    const [q, setQ] = useState('')
    const [errorMessages, setErrorMessages] = useState([])

    const handleQueryChange = (event) => {
        const updateFilter = debounce(() => {
            setQ(event.target.value.trim().toLowerCase())
        }, 700)
        updateFilter()
    };

    const handleDelete = (item) => {
        if (!confirm(`Are you sure you want to delete "${item.title}"?`)) {
            return
        }
        fetch(`/api/delete-image-item?id=${item.id}`)
            .then(res => {
                if (res.status === 204) {
                    setItems(items.filter(i => i.id !== item.id))
                } else {
                    return res.json().then(({error}) => {
                        setErrorMessages([error])
                    })
                }
            })
            .catch(error => {
                setErrorMessages([error.message])
            })
    }

    const filterItem = item => item.title.toLowerCase().includes(q)

    useEffect(() => {
        fetch(`/api/image-items`)
            .then((res) => res.json())
            .then(({data, error}) => {
                if (!error) {
                    setItems(data ?? [])
                } else {
                    setErrorMessages([error])
                }
                setLoading(false)
            })
    }, [])

    useEffect(() => {
        if (loading === false) {
            setTimeout(() => {
                (document
                    .querySelector('#search-panel input') as HTMLInputElement)
                    ?.focus()
            }, 200)
        }
    }, [loading])

    return (
        <div className="min-h-screen" style={{backgroundColor: '#E8E6E5'}}>
            <Head>
                <title>Image items - CiCi Dashboard</title>
            </Head>
            <Header/>

            <div className="mx-auto max-w-6xl px-4 mt-4 pb-10">

                <ScreenHeader
                    backLink="/manage"
                    title="Image items"
                    rightSlot={<AnchorButton
                        type="submit"
                        intent="primary"
                        text="Add Image Item"
                        icon="cube-add"
                        onClick={() => router.push(`/image-items/new`)}
                    />}
                />

                {loading ? <Spinner/>
                    :
                    <div>
                        <ErrorBlock errorMessages={errorMessages}/>

                        <div id="search-panel" className="max-w-xs">
                            <InputGroup
                                type="search"
                                leftIcon="filter"
                                onChange={handleQueryChange}
                            />
                        </div>

                        <table className="mt-4">
                            <thead>
                            <tr className="border-b border-gray-300 bg-gray-300">
                                <th className="px-4 py-1 text-left">Image</th>
                                <th className="px-4 py-1 text-left">Title</th>
                                <th className="px-4 py-1">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {items.filter(filterItem).map(item => (
                                <tr key={item.id} className="border-b border-gray-300 hover:bg-gray-50">
                                    <td className="px-4 py-2">
                                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                                            <img src={item.url} alt={item.title} className="h-10 w-auto rounded"/>
                                        </a>
                                    </td>
                                    <td className="px-4 py-1">{item.title}</td>
                                    <td className="px-4 py-1 flex gap-x-2">
                                        <Button size="small"
                                                icon="edit"
                                                text="Edit"
                                                onClick={() => router.push(`/image-items/${item.id}`)}
                                        />
                                        <Button size="small"
                                                icon="trash"
                                                intent="danger"
                                                text="Delete"
                                                onClick={() => handleDelete(item)}
                                        />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                }
            </div>
        </div>
    );
}

export default withAdminUser(ListImageItems)
