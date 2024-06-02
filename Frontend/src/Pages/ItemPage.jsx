import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/ItemPage.css';

const ItemPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const navigate = useNavigate();
  
  const curUsername = localStorage.getItem('username');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5050/post/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          console.log(response);
          console.error('Failed to fetch product');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!product) return;

      try {
        const response = await fetch(`http://localhost:5050/post/${product._id}/availability`);
        if (response.ok) {
          const data = await response.json();
          setAvailability({
            start: new Date(data[0]),
            end: new Date(data[1])
          });
        } else {
          console.error('Failed to fetch availability');
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    };

    fetchAvailability();
  }, [product]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`http://localhost:5050/post/${id}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(data);
        } else {
          console.error('Failed to fetch comments');
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [id]);

  const handleCommentSubmit = async () => {
    if (!newComment) return;

    const commentData = {
      username: 'Paul \'penguin\' Eggert', 
      comment: newComment,
    };

    try {
      const response = await fetch(`http://localhost:5050/post/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });

      if (response.ok) {
        const createdComment = await response.json();
        setComments([...comments, createdComment]);
        setNewComment('');
      } else {
        console.error('Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  const handleDelete = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from local storage
      if (!token) {
        throw new Error('No token found. Please log in again.');
      }
      const deleteResponse = await fetch(`http://localhost:5050/post/${id}`,{
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}` //must include token in Authorization header!
        }, 
      });
      navigate('/profile');
    } catch{
      alert("Failed to delete post");
      navigate('/profile');
    }
  };

  function ButtonLink({ to, children, onClick }) {
    return (
      <Link to={to}> 
        <button onClick={onClick}>
          {children} </button>
      </Link>
    );
  }

  const isDateAvailable = (date) => {
    const { start, end } = availability;
    return start && end && date >= start && date <= end;
  };

  return (
    <div className='item-page'>
      <div className='item-display'>
        <div className='item-image'>
          <img src={`data:image/jpeg;base64,${product.image}`} alt={product.name} />
        </div>
        <div className='item-info'>
          <h3>{product.name}</h3>
          <p>{product.desc}</p>
          {product.isForSale && <p>Buy Price: {product.buyPrice}</p>}
          {product.isForRent && 
          <p>Rent Price: {product.rentPrice}</p> && 
          <DatePicker
          inline
          readOnly
          dayClassName={date => isDateAvailable(date) ? 'available' : undefined}
        />}

          {product.isForRent && <p>Rent Price: {product.rentPrice}</p>}
          <div>
            {curUsername === product.username && (
              <>
                <ButtonLink to={`/edititem/${product._id}`} onClick={() => localStorage.setItem('EditPageButton', 'true')}> Edit Post </ButtonLink>
              <h5>
                <button onClick={handleDelete}>Delete Post</button>
              </h5>
              </>
            )}
          </div>
        </div>
      </div>
      <div className='comment-section'>
        <h3>Reviews</h3>
        <div className='comment-input'>
        <form onSubmit={handleCommentSubmit}>
          <textarea
            type='text'
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder='Add a comment'
          />
          <button type='submit'>Post</button>
          </form> 
        </div>
          <div className='comments-list'>
            {comments.map((comment, index) => (
              <div key={index} className='comment'>
                <p><strong>{comment.username}</strong>
                 {comment.comment}</p>
              </div>
            ))}
          </div>
      </div>

    </div>
  );
};

export default ItemPage;
