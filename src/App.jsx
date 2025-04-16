import React, { useEffect, useState } from 'react';
const apiUrl = import.meta.env.VITE_API_URL;


function App() {
  const [usersCache, setUsersCache] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTab, setCurrentTab] = useState('new');
  const [totalPages, setTotalPages] = useState({});
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const pageSize = 50;

  useEffect(() => {
    fetchUsers(currentPage, currentTab);
  }, [currentPage, currentTab]);

  const fetchUsers = async (page, status) => {
    if (usersCache[status]?.[page]) return;
    try {
      const response = await fetch("https://backend-eta-one-56.vercel.app/user/?page=${page}&limit=${pageSize}&status=${status}");
      const data = await response.json();
      if (!usersCache[status]) usersCache[status] = {};
      usersCache[status][page] = data.users;
      setUsersCache({ ...usersCache });
      setTotalPages(prev => ({ ...prev, [status]: data.totalPages }));
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleCheckboxChange = (userId, checked) => {
    const newSelected = new Set(selectedUsers);
    checked ? newSelected.add(userId) : newSelected.delete(userId);
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = (checked) => {
    const users = usersCache[currentTab]?.[currentPage] || [];
    const newSelected = new Set(selectedUsers);
    users.forEach(user => checked ? newSelected.add(user._id) : newSelected.delete(user._id));
    setSelectedUsers(newSelected);
  };

  const download = async (ids) => {
    const response = await fetch("https://backend-eta-one-56.vercel.app/user/download-selected-users", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds: ids })
    });
    console.log("download user",response)
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'selected_users.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } else {
      alert('Failed to download users.');
      
    }
  };

  const users = usersCache[currentTab]?.[currentPage] || [];

  return (
    <div className="max-w-2xl mx-auto bg-white p-5 rounded-lg shadow-md">
    <div className="flex flex-wrap justify-center sm:justify-start border-b mb-4">
      {['new', 'inProgress', 'completed'].map(tab => (
        <button
          key={tab}
          className={`px-4 py-2 tab-btn ${currentTab === tab ? 'font-bold' : ''}`}
          onClick={() => {
            setCurrentPage(1);
            setCurrentTab(tab);
          }}>
          {tab[0].toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-4 font-bold bg-gray-200 p-2 rounded mt-2">
      <div>
        <input type="checkbox" onChange={e => handleSelectAll(e.target.checked)} className="mr-2" />
        Select
      </div>
      <div>Full Name</div>
      <div>Company</div>
      <div>Role</div>
    </div>

    <div>
      {users.length ? users.map(user => (
        <div
          key={user._id}
          className="grid grid-cols-1 sm:grid-cols-4 p-2 border-b hover:bg-gray-200 cursor-pointer"
          onClick={() => window.location.href = `/dashboard/read/${user._id}`}
        >
          <div>
            <input
              type="checkbox"
              className="user-checkbox"
              value={user._id}
              checked={selectedUsers.has(user._id)}
              onClick={e => e.stopPropagation()}
              onChange={e => handleCheckboxChange(user._id, e.target.checked)}
            />
          </div>
          <div>{user.fullname}</div>
          <div>{user.companyName}</div>
          <div>{user.role}</div>
        </div>
      )) : <div className='text-gray-500 p-2'>No tasks found</div>}
    </div>

    <div className="flex justify-between mt-4">
      <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className="px-4 py-2 bg-gray-300 rounded" disabled={currentPage === 1}>Previous</button>
      <div>Pages: {currentPage}/{totalPages[currentTab]}</div>
      <button onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 bg-blue-500 text-white rounded" disabled={users.length < pageSize}>Next</button>
    </div>

    <button onClick={() => download(Array.from(selectedUsers))} className="mt-4 px-4 py-2 bg-green-500 text-white rounded">Download Selected</button>
    <button onClick={() => download("All")} className="mt-4 ml-2 px-4 py-2 bg-green-500 text-white rounded">Download All</button>
  </div>
  )
}

export default App
