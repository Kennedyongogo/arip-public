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
  AppBar,
  Toolbar,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Close,
  Search as SearchIcon,
  Facebook,
  Instagram,
} from "@mui/icons-material";
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
      <AppBar
        position="static"
        sx={{
          mb: 1,
          backgroundColor: "primary.main",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
            ARIP News
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            sx={{ color: "white" }}
            href="https://facebook.com"
            target="_blank"
          >
            <Facebook />
          </IconButton>
          <IconButton
            sx={{ color: "white" }}
            href="https://instagram.com"
            target="_blank"
          >
            <Instagram />
          </IconButton>
          <IconButton
            sx={{ color: "white", p: 0.8 }}
            href="https://wa.me/"
            target="_blank"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.477 2 2 6.477 2 12c0 1.989.583 3.838 1.588 5.393L2 22l4.707-1.561A9.953 9.953 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.657 0-3.22-.506-4.522-1.374l-.322-.207-2.797.927.93-2.72-.21-.332A7.963 7.963 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8zm4.406-5.845c-.242-.121-1.434-.707-1.655-.788-.222-.081-.384-.121-.546.122-.161.242-.623.788-.764.95-.141.161-.282.181-.524.06-.242-.121-1.022-.377-1.947-1.202-.72-.642-1.207-1.433-1.35-1.675-.141-.242-.015-.373.106-.494.109-.108.242-.282.363-.423.121-.141.161-.242.242-.403.081-.161.04-.303-.02-.424-.06-.121-.546-1.318-.748-1.803-.197-.474-.398-.41-.546-.418l-.464-.008c-.161 0-.424.06-.646.303-.222.242-.848.828-.848 2.02 0 1.192.868 2.345.988 2.507.121.161 1.71 2.613 4.15 3.561.58.199 1.032.317 1.384.406.581.147 1.11.126 1.528.077.466-.055 1.434-.586 1.637-1.152.202-.566.202-1.051.142-1.152-.06-.101-.22-.161-.462-.282z"
                fill="white"
              />
            </svg>
          </IconButton>
          <IconButton
            sx={{ color: "white", p: 0.8 }}
            href="https://tiktok.com"
            target="_blank"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.5 3C16.5 4.933 18.067 6.5 20 6.5V9.5C18.067 9.5 16.5 7.933 16.5 6V15.5C16.5 18.5376 13.5376 21 10 21C6.46243 21 3.5 18.5376 3.5 15.5C3.5 12.4624 6.46243 10 10 10V13C8.067 13 6.5 14.567 6.5 16.5C6.5 18.433 8.067 20 10 20C11.933 20 13.5 18.433 13.5 16.5V3H16.5Z"
                fill="white"
              />
            </svg>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} sx={{ px: 1, pt: 1, pb: 4 }}>
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            p: { xs: 1, sm: 2, md: 3 },
            backgroundColor: "white",
          }}
        >
          <Typography
            variant="h4"
            sx={{ mb: 4, fontWeight: "bold", color: "primary.main" }}
          >
            Latest News
          </Typography>

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
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Box sx={{ width: "100%", maxWidth: 1600, mx: "auto", p: 2 }}>
                  <Grid container spacing={3} justifyContent="center">
                    {news.map((item) => (
                      <Grid
                        item
                        xs={3}
                        sm={3}
                        md={3}
                        key={item.id}
                        sx={{ display: "flex", justifyContent: "center" }}
                      >
                        <Card
                          onClick={() => handleNewsClick(item)}
                          sx={{
                            cursor: "pointer",
                            width: 250,
                            height: 300,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          {item.mediaUrl && item.mediaType === "image" && (
                            <CardMedia
                              component="img"
                              height="180"
                              image={getFullMediaUrl(item.mediaUrl)}
                              alt={item.title}
                              sx={{
                                objectFit: "cover",
                                borderRadius: 2,
                              }}
                            />
                          )}
                          {item.mediaUrl && item.mediaType === "video" && (
                            <CardMedia
                              component="video"
                              height="180"
                              src={getFullMediaUrl(item.mediaUrl)}
                              alt={item.title}
                              sx={{
                                objectFit: "cover",
                                borderRadius: 2,
                              }}
                              muted
                              controls={false}
                              autoPlay={false}
                            />
                          )}
                          <CardContent sx={{ flexGrow: 1, minHeight: 120 }}>
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
                </Box>
              </Box>

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
        </Card>
      </Container>
    </ThemeProvider>
  );
};

export default View;
