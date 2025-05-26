import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  TextField,
  MenuItem,
  Pagination,
  CircularProgress,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Close, Search as SearchIcon } from "@mui/icons-material";
import Fade from "@mui/material/Fade";

// API configuration
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "http://38.242.243.113:4035"
    : "http://localhost:3003";

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#19bdb7",
    },
    secondary: {
      main: "#ff9800",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          },
        },
      },
    },
  },
});

// Helper to get full media URL
const getFullMediaUrl = (mediaUrl) => {
  if (!mediaUrl) return "";
  if (mediaUrl.startsWith("http")) return mediaUrl;
  return `${API_BASE_URL}${mediaUrl}`;
};

// News Details Dialog Component
const NewsDetailsDialog = ({ news, open, onClose }) => {
  if (!news) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={300}
    >
      <DialogTitle sx={{ p: 3 }}>
        <Typography
          variant="h5"
          sx={{ color: "primary.main", fontWeight: "bold" }}
        >
          {news.title}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {news.mediaUrl && (
            <Grid item xs={12}>
              {news.mediaType === "image" ? (
                <img
                  src={getFullMediaUrl(news.mediaUrl)}
                  alt={news.title}
                  style={{
                    width: "100%",
                    maxHeight: "400px",
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              ) : (
                <video
                  src={getFullMediaUrl(news.mediaUrl)}
                  controls
                  style={{ width: "100%", maxHeight: "400px", borderRadius: 8 }}
                />
              )}
            </Grid>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Chip label={news.category} color="primary" />
              {news.tags?.map((tag, index) => (
                <Chip key={index} label={tag} variant="outlined" />
              ))}
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
              {news.content}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Published on {new Date(news.publishedAt).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

// Main View Component
const View = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedNews, setSelectedNews] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const categories = [
    "Politics",
    "Technology",
    "Business",
    "Sports",
    "Entertainment",
    "Health",
    "Science",
  ];

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 9,
        ...(search && { search }),
        ...(category && { category }),
      });

      console.log("Fetching news with params:", queryParams.toString());
      const response = await fetch(`${API_BASE_URL}/api/news?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch news");

      const data = await response.json();
      console.log("API Response:", data);
      setNews(data.data);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    console.log("Current news state:", news);
    console.log("Current page:", page);
    console.log("Current total pages:", totalPages);
    fetchNews();
  }, [fetchNews]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleNewsClick = (newsItem) => {
    setSelectedNews(newsItem);
    setDetailsDialogOpen(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          sx={{ mb: 4, fontWeight: "bold", color: "primary.main" }}
        >
          Latest News
        </Typography>

        {/* Debug Info */}
        <Box sx={{ mb: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            Debug Info:
          </Typography>
          <Typography variant="body2">
            Loading: {loading ? "true" : "false"}
          </Typography>
          <Typography variant="body2">News Items: {news.length}</Typography>
          <Typography variant="body2">Current Page: {page}</Typography>
          <Typography variant="body2">Total Pages: {totalPages}</Typography>
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Search"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 200 }}
            InputProps={{
              endAdornment: <SearchIcon color="action" />,
            }}
          />
          <TextField
            select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* News Grid */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {news.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card
                    onClick={() => handleNewsClick(item)}
                    sx={{ cursor: "pointer", height: "100%" }}
                  >
                    {item.mediaUrl && item.mediaType === "image" && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={getFullMediaUrl(item.mediaUrl)}
                        alt={item.title}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {item.content}
                      </Typography>
                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          label={item.category}
                          size="small"
                          color="primary"
                        />
                        {item.tags?.slice(0, 2).map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        {new Date(item.publishedAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          </>
        )}

        {/* News Details Dialog */}
        <NewsDetailsDialog
          news={selectedNews}
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
        />
      </Container>
    </ThemeProvider>
  );
};

export default View;
