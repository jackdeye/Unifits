import React, { useState } from 'react';
import "../styles/Login.css"
//import DatePicker from 'react-datepicker';
//import 'react-datepicker/dist/react-datepicker.css';
import {
  TextField,
  Grid,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CloudUpload, Send } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const PostPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    image: null,
    isForSale: true,
    isForRent: true,
    buyPrice: '',
    rentPrice: '',
    availability: [null, null],
  });

  const handleChange = (event) => {
    const { name, value, files, type, checked } = event.target;
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0], // Store only the first file
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    console.log(formData);
  };

  const handleStartDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      availability: [date.toDate(), prev.availability[1]]
    }));
  };

  const handleEndDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      availability: [prev.availability[0], date.toDate()]
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('token'); // Retrieve the token from local storage
      if (!token) {
        throw new Error('No token found. Please log in again.');
      }
      const username = localStorage.getItem('username');
      console.log("username: ", username);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('desc', formData.desc);
      formDataToSend.append('image', formData.image);
      formDataToSend.append('isForSale', formData.isForSale);
      formDataToSend.append('isForRent', formData.isForRent);
      formDataToSend.append('buyPrice', formData.buyPrice);
      formDataToSend.append('rentPrice', formData.rentPrice);
      formDataToSend.append('availability', JSON.stringify(formData.availability));
      formDataToSend.append('username', username);

      const response = await fetch('http://localhost:5050/post/upload', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend,
        headers: {
          'Authorization': `Bearer ${token}` // Must include token in Authorization header!
        },
      });

      if (response.ok) {
        alert('Post saved successfully!');
        setFormData({
          name: '',
          desc: '',
          image: null,
          isForSale: true,
          isForRent: true,
          buyPrice: '',
          rentPrice: '',
          availability: [null, null]
        }); // Reset form
      } else {
        const errorText = await response.text();
        console.error('Failed to save post:', errorText);
        throw new Error('Failed to save post.');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('Failed to save post.');
    }
  };

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      width = "80vh"
      height="80vh"
      margin="auto"
    >
      <Grid item xs={6} display="flex" flexDirection="column">
        <TextField
          sx={{ m: 1, width: '25ch' }}
          id="outlined-required"
          label="Title"
          value={formData.name}
          name="name"
          onChange={handleChange}
        />
        <TextField
          sx={{ m: 1, width: '25ch' }}
          id="outlined-required"
          label="Description"
          value={formData.desc}
          name="desc"
          onChange={handleChange}
        />
      { formData.isForSale ? 
        <FormControl sx={{ m: 1, width: '25ch' }}>
          <InputLabel htmlFor="outlined-adornment-amount">Buy Price</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
            name="buyPrice"
            value={formData.buyPrice}
            label="Buy Price"
            onChange={handleChange}
          />
        </FormControl>
        :
        <div/>
      }
      { formData.isForRent ? 
        <FormControl sx={{ m: 1, width: '25ch' }}>
          <InputLabel htmlFor="outlined-adornment-amount">Rent Price</InputLabel>
          
          <OutlinedInput
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
            name="rentPrice"
            value={formData.rentPrice}
            label="Rent Price"
            onChange={handleChange}
          />
        </FormControl>
        :
        <div/>
      }
      </Grid>
      <Grid item xs={4} display="flex" flexDirection="column" alignItems="center">
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUpload/>}
          sx={{ m: 1, width: '25ch' }}
        >
          Upload file
          <VisuallyHiddenInput type="file" name="image" onChange={handleChange} />
        </Button>
        <FormGroup>
          <FormControlLabel 
            onChange={handleChange}
            control={<Checkbox defaultChecked />}
            label="For Sale"
            value={formData.isForSale}
            name="isForSale"
          />
          <FormControlLabel 
            onChange={handleChange}
            control={<Checkbox defaultChecked />}
            label="For Rent"
            value={formData.isForRent}
            name="isForRent"
          />
        </FormGroup>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Start Date" 
            onChange={handleStartDateChange}
            sx={{ m: 1, width: '25ch' }}
          />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="End Date" 
            onChange={handleEndDateChange}
            sx={{ m: 1, width: '25ch' }}
          />
        </LocalizationProvider>
        <Button variant="contained" onClick={handleSubmit} endIcon={<Send/>}>
          Post
        </Button>
      </Grid>
    </Grid>
  );

  /*return (
    <div className='container'>
      <h1 className='header'>Create a New Post</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Title:
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </label>
        </div>
        <div>
          <label>
            Description:
            <textarea name="desc" value={formData.desc} onChange={handleChange} required />
          </label>
        </div>
        <div>
          <label>
            Image:
            <input type="file" name="image" accept="image/*" onChange={handleChange} required />
          </label>
        </div>
        <div>
          <label>
            For Sale:
            <input type="checkbox" name="isForSale" checked={formData.isForSale} onChange={handleChange} />
          </label>
        </div>
        <div>
          <label>
            For Rent:
            <input type="checkbox" name="isForRent" checked={formData.isForRent} onChange={handleChange} />
          </label>
        </div>
        {formData.isForSale && (
          <div>
            <label>
              Buy Price:
              <input type="number" name="buyPrice" value={formData.buyPrice} onChange={handleChange} required={formData.isForSale} />
            </label>
          </div>
        )}
        {formData.isForRent && (
          <div>
            <label>
              Rent Price:
              <input type="number" name="rentPrice" value={formData.rentPrice} onChange={handleChange} required={formData.isForRent} />
            </label>
          </div>
        )}
        <div>
          <label>
            Start Date:
            <DatePicker
              selected={formData.availability[0]}
              onChange={handleStartDateChange}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select Start Date"
              className="date-input"
            />
          </label>
        </div>
        <div>
          <label>
            End Date:
            <DatePicker
              selected={formData.availability[1]}
              onChange={handleEndDateChange}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select End Date"
              className="date-input"
            />
          </label>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );*/
};

export default PostPage;
